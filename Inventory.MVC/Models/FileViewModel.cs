using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Inventory.MVC.Models
{
    public class FileViewModel
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public long Size { get; set; }

        public DateTime DateCreated { get; set; }
    }
}