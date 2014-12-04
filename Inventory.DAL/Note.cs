using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Inventory.DAL
{
    public class Note : EntityBase
    {
        public string Name { get; set; }

        public string Description { get; set; }

        public string ParentType { get; set; }

        public long? ParentTypeId { get; set; }
    }
}
