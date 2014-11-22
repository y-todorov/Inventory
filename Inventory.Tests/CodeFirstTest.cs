using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Inventory.DAL;
using Xunit;

namespace Inventory.Tests
{

    public class CodeFirstTest
    {
        [Fact]
        public void SearchAllEntities()
        {
            string search = "12";
            using (var context = new InventoryContext())
            {
                var stringProperties = typeof(Product).GetProperties().Where(prop =>
    prop.PropertyType == typeof(string));


                var res = context.Products.FullTextSearch("1", false).ToList();;



            }
            Assert.True(true);
        }

        [Fact]

        public void SaveProductTest()
        {
            return;
            using (var context = new InventoryContext())
            {
                //context.Database.Log = Trace.WriteLine;

                var prod = new Product
                {
                    Name = "хляб",
                    Quantity = 12.12m,
                    ReorderLevel = 12
                };

                var pc = new ProductCategory { Name = "Хлебни" };
                var st = new ProductStore { Name = "Хладилник 1" };
                var pum = new ProductUnitMeasure { Name = "Килограм." };

                prod.Category = pc;
                prod.Store = st;
                prod.UnitMeasure = pum;

                context.Products.Add(prod);

                var prod1 = new Product
                {
                    Name = "морков",
                    Quantity = 12.12m,
                    ReorderLevel = 12
                };
                var pc1 = new ProductCategory { Name = "Зеленчуци" };
                var st1 = new ProductStore { Name = "Кухня" };
                var pum1 = new ProductUnitMeasure { Name = "Пакет" };

                prod1.Category = pc1;
                prod1.Store = st1;
                prod1.UnitMeasure = pum1;

                context.Products.Add(prod1);

                context.SaveChanges();
            }
        }

    }
}
