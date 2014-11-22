using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Inventory.MVC.Models
{
    public class SearchViewModel
    {
        public long EntityId { get; set; }

        public string EntityName { get; set; }

        public string EntityToString { get; set; }
    }
}