using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Inventory.MVC.Models
{
    public class ProcessViewModel
    {
        public int HandleCount { get; set; }

        public int ThreadsCount { get; set; }

        public long WorkingSet64 { get; set; }

        public string ProcessName { get; set; }

        public string Description { get; set; }

    }
}