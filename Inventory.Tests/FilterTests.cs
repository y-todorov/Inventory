using Inventory.DAL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Linq.Dynamic;
using Xunit;

namespace Inventory.Tests
{
    public class FilterTests
    {
        [Fact]
        public void PropertyEquals()
        {
            using (InventoryContext context = new InventoryContext())
            {
                string townAsString = "Тъпчилещово";
                var res = context.Elements.OfType<Town>().Where("Name == @0", townAsString).FirstOrDefault();

                Assert.NotNull(res);
                Assert.Equal(townAsString, res.Name);
            }
        }

        [Fact]
        public void PropertyNotEquals()
        {
            using (InventoryContext context = new InventoryContext())
            {
                string townAsString = "Тъпчилещово";
                var res = context.Elements.OfType<Town>().Where("Name != @0", townAsString).ToList();
                
                Assert.NotNull(res);

                foreach (Town town in res)
                {
                    Assert.False(townAsString == town.Name);
                }
            }
        }
        
        [Fact]
        public void PropertyStartsWith()
        {
            using (InventoryContext context = new InventoryContext())
            {
                 string townAsString = "Тъп";
                var res = context.Elements.OfType<Town>().Where("Name.StartsWith(@0)", townAsString).FirstOrDefault();

                Assert.NotNull(res);
                Assert.True(res.Name.StartsWith(townAsString));


            }
        }

        [Fact]
        public void PropertyEndsWith()
        {
            using (InventoryContext context = new InventoryContext())
            {
                string townAsString = "ово";
                var res = context.Elements.OfType<Town>().Where("Name.EndsWith(@0)", townAsString).FirstOrDefault();

                Assert.NotNull(res);
                Assert.True(res.Name.EndsWith(townAsString));
            }
        }

        [Fact]
        public void PropertyContains()
        {
            using (InventoryContext context = new InventoryContext())
            {
                string townAsString = "Тъп";
                var res = context.Elements.OfType<Town>().Where("Name.Contains(@0)", townAsString).FirstOrDefault();

                Assert.NotNull(res);
                Assert.True(res.Name.Contains(townAsString));
            }
        }

        [Fact]
        public void PropertyDoesNotContain()
        {
            using (InventoryContext context = new InventoryContext())
            {
                string townAsString = "а";
                var res = context.Elements.OfType<Town>().Where("Name.Contains(@0) == false", townAsString).ToList();

                Assert.NotNull(res);

                foreach (Town town in res)
                {
                    Assert.False(town.Name.Contains(townAsString));
                }
                
            }
        }


    }
}
