using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Inventory.DAL
{
    public class ProductCustomField : CustomField
    {
        public long? ProductId { get; set; }

        public Product Product { get; set; }
    }
}
