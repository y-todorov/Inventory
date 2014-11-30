using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace Inventory.Tests
{
    public class MiscTests
    {
        [Fact]
        public void TestParseType()
        {
            Type stringType = typeof (string);

            Type parsedType = Type.GetType(stringType.FullName);

            Assert.NotNull(parsedType);


        }
    }
}
