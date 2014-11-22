using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Inventory.DAL
{
    public class ChangeLog : EntityBase
    {
        public long EntityId { get; set; }
        public string EntityName { get; set; }
        public string PropertyName { get; set; }
        public string Operation { get; set; }
        public string OldValue { get; set; }
        public string NewValue { get; set; }
    }
}