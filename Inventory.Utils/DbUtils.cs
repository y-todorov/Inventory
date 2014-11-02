using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.SqlServer.Management.Common;
using Microsoft.SqlServer.Management.Smo;

namespace Inventory.Utils
{
    public static class DbUtils
    {
        public static void TransferDatabase(string sourceConnString, string destinationConnString)
        {
            var scsbSource = new SqlConnectionStringBuilder(sourceConnString);
            var scsbDestination = new SqlConnectionStringBuilder(destinationConnString);

            var mySourceServer = new Server(scsbDestination.DataSource);
            var myDestinationServer = new Server(scsbDestination.DataSource);

            mySourceServer.ConnectionContext.ConnectionString = sourceConnString;
            myDestinationServer.ConnectionContext.ConnectionString = destinationConnString;

            mySourceServer.ConnectionContext.Connect();
            myDestinationServer.ConnectionContext.Connect();
            Microsoft.SqlServer.Management.Smo.Database sourceDatabase = mySourceServer.Databases[scsbSource.InitialCatalog];
            Microsoft.SqlServer.Management.Smo.Database destinationDatabase = myDestinationServer.Databases[scsbDestination.InitialCatalog];


            var conn = new ServerConnection(myDestinationServer.Name, scsbDestination.UserID, scsbDestination.Password);
            conn.DatabaseName = destinationDatabase.Name;

            conn.BeginTransaction();

            List<string> deleteCommands = GetDeleteCommands(destinationDatabase);
            ExecuteCommands(conn, deleteCommands);

            List<string> createSchemaCommnads = GetCreateSchemaCommands(sourceDatabase);
            ExecuteCommands(conn, createSchemaCommnads);

            List<string> dataCommnads = GetAllDataCommands(sourceDatabase);
            ExecuteCommands(conn, dataCommnads);

            conn.CommitTransaction();
        }

        private static List<string> GetDeleteCommands(Microsoft.SqlServer.Management.Smo.Database database)
        {
            var transfer = new Transfer(database);
            transfer.Options.ScriptDrops = true;

            List<string> scipts = transfer.EnumScriptTransfer().ToList();
            return scipts;
        }

        private static List<string> GetCreateSchemaCommands(Microsoft.SqlServer.Management.Smo.Database database)
        {
            var transfer = new Transfer(database);
            transfer.Options.ScriptSchema = true;

            List<string> scipts = transfer.EnumScriptTransfer().ToList();
            return scipts;
        }

        private static List<string> GetAllDataCommands(Microsoft.SqlServer.Management.Smo.Database database)
        {
            var transfer = new Transfer(database);
            transfer.Options.ScriptData = true;
            transfer.Options.ScriptSchema = false;

            List<string> scipts = transfer.EnumScriptTransfer().ToList();
            return scipts;
        }

        private static void ExecuteCommands(ServerConnection conn, List<string> commands)
        {
            commands = GetBatchCommands(commands);
            foreach (string command in commands)
            {
                Console.WriteLine(command.Split(new[] { Environment.NewLine }, StringSplitOptions.RemoveEmptyEntries).FirstOrDefault());
                conn.ExecuteNonQuery(command);
            }
        }

        private static List<string> GetBatchCommands(List<string> commands)
        {
            var result = new List<string>();
            var sb = new StringBuilder();

            string lastIdentityInsert = "";

            foreach (string command in commands)
            {
                if (command.Trim().StartsWith("SET IDENTITY_INSERT") && command.Trim().EndsWith("ON"))
                {
                    lastIdentityInsert = command;
                    if (sb.Length != 0)
                    {
                        result.Add(sb.ToString());
                    }
                    sb = new StringBuilder();
                }
                sb.AppendLine(command);
                if (sb.Length > 2000000) // ако заявката прекалено голям (insert най-вече) може да свърши паметта, за това се прави това
                {
                    result.Add(sb.ToString());
                    sb = new StringBuilder();
                    sb.AppendLine(lastIdentityInsert);
                }
            }
            if (result.Count == 0)
            {
                return commands;
            }
            return result;
        }
    }
}
