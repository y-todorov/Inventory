using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Inventory.MVC.Models
{
    public class DirectoryViewModel
    {
        public string id { get; set; }
        public string Name { get; set; }
        public string FullName { get; set; }

        public bool hasChildren { get; set; }
    }
}