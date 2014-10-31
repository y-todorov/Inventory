using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Inventory.MVC.Resources;

namespace Inventory.MVC.Models
{
    public class ViewModelBase
    {
        //[ReadOnly(true)]
        //[HiddenInput(DisplayValue = false)] // временно
        [Display(ResourceType = typeof(ViewModelResources),
       Name = "ViewModel_Id",
       Order = -1000)]
        public long Id { get; set; }

        //[ReadOnly(true)]
        //[HiddenInput(DisplayValue = false)] // временно
        [DataType(DataType.DateTime), DisplayFormat(DataFormatString = "{0:d.M.yyyy 'г.' H:mm:ss}", ApplyFormatInEditMode = true)]
        [Display(ResourceType = typeof(ViewModelResources),
            Name = "ViewModelBase_CreatedOn_Name")]
        public DateTime? CreatedOn { get; set; }

        //[ReadOnly(true)]
        //[HiddenInput(DisplayValue = false)] // временно
        [Display(ResourceType = typeof(ViewModelResources),
    Name = "ViewModelBase_CreatedBy_Name")]
        public string CreatedBy { get; set; }

        //[ReadOnly(true)]
        //[HiddenInput(DisplayValue = false)] // временно
        [DataType(DataType.DateTime), DisplayFormat(DataFormatString = "{0:d.M.yyyy 'г.' H:mm:ss}", ApplyFormatInEditMode = true)]
        [Display(ResourceType = typeof(ViewModelResources),
        Name = "ViewModelBase_ModifiedOn_Name")]
        public DateTime? ModifiedOn { get; set; }

        //[ReadOnly(true)]
        //[HiddenInput(DisplayValue = false)] // временно
        [Display(ResourceType = typeof(ViewModelResources),
    Name = "ViewModelBase_ModifiedBy_Name")]
        public string ModifiedBy { get; set; }
    }
}