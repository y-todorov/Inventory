using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Inventory.MVC.Models
{
    public class NoteViewModel : ViewModelBase
    {
        public string Name { get; set; }

        public string Description { get; set; }

        public string ParentType { get; set; }

        public long? ParentTypeId { get; set; }
    }
}