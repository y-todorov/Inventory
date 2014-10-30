using System.Collections.Generic;

namespace Inventory.DAL
{
    public class ProductCategory : Element
    {
        public virtual List<Product> Products { get; set; }
    }
}