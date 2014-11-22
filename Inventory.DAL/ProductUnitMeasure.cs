using System.Collections.Generic;

namespace Inventory.DAL
{
    public class ProductUnitMeasure : Element
    {
        public virtual List<Product> Products { get; set; }

        public override string ToString()
        {
            return string.Format("{0} - {1}.{2}", "Мярка", Id, Name);

        }
    }
}