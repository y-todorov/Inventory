using System.Collections.Generic;

namespace Inventory.DAL
{
    public class ProductUnitMeasure : Element
    {
        public virtual List<Product> Products { get; set; }
    }
}