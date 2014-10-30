using System.Collections.Generic;

namespace Inventory.DAL
{
    public class ProductStore : Element
    {
        public virtual List<Product> Products { get; set; }
    }
}