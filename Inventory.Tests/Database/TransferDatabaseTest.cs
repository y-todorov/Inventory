using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Inventory.Utils;
using Xunit;

namespace Inventory.Tests.Database
{
    public class TransferDatabaseTest
    {
        [Fact]
        public void Transer()
        {
            string source = ConfigurationManager.ConnectionStrings["source"].ConnectionString;
            string destination = ConfigurationManager.ConnectionStrings["destination"].ConnectionString;

            DbUtils.TransferDatabase(source, destination);
        }
    }
}
