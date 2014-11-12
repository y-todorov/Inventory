using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Inventory.MVC.Models
{
    public class FileViewModel
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public long? Size { get; set; }

        [DataType(DataType.Date)]
        public DateTime? DateCreated { get; set; }
    }
}