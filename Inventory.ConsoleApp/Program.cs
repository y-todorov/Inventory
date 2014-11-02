using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Inventory.Utils;

namespace Inventory.ConsoleApp
{
    class Program
    {
        static void Main(string[] args)
        {
            string source = ConfigurationManager.ConnectionStrings["source"].ConnectionString;
            string destination = ConfigurationManager.ConnectionStrings["destination"].ConnectionString;

            DbUtils.TransferDatabase(source, destination);
        }
    }
}
