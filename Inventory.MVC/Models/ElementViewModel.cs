using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using Inventory.MVC.Resources;

namespace Inventory.MVC.Models
{
    public class ElementViewModel : ViewModelBase
    {
             [Required(ErrorMessageResourceType = typeof(ViewModelResources),
            ErrorMessageResourceName = "RequiredErrorMessage")]
         [Display(ResourceType = typeof(ViewModelResources),
            Name = "ElementViewModel_Name_Name")]
        public string Name { get; set; }
    }
}