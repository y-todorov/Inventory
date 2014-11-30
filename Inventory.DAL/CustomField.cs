using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Inventory.DAL
{
    public class CustomField : EntityBase
    {

        public string StringValue { get; set; }

        public long? LongValue { get; set; }

        public decimal? DecimalValue { get; set; }

        public DateTime? DateTimeValue { get; set; }

        public bool? BoolValue { get; set; }


    }
}
