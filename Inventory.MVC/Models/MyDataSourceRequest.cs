using Kendo.DynamicLinq;
using System.Collections.Generic;

namespace Inventory.MVC.Models
{
    public class MyDataSourceRequest
    {
        public int Take { get; set; }
        public int Skip { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public Filter Filter { get; set; }
        public IEnumerable<Sort> Sort { get; set; }
        public IEnumerable<Aggregator> Aggregates { get; set; }
    }
}