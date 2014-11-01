using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;

namespace KendoMVCWrappers.Models
{
    public class Person
    {
        public int PersonID { get; set; }
        [UIHint("GridForeignKey")]
        public int ForeignKey { get; set; }
        public string Name { get; set; }
        public DateTime BirthDate { get; set; }
    }
}