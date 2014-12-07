using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Inventory.MVC.Resources;

namespace Inventory.MVC.Models
{
    public class NoteViewModel : ViewModelBase
    {
          [Display(ResourceType = typeof(ViewModelResources),
            Name = "NoteViewModel_Name_Name")]
        public string Name { get; set; }


        //   [UIHint("HtmlEditorText")]
        [DataType(DataType.MultilineText)]
          [Display(ResourceType = typeof(ViewModelResources),
            Name = "NoteViewModel_Description_Name")]
        public string Description { get; set; }

         [HiddenInput(DisplayValue = false)]
            [Display(ResourceType = typeof(ViewModelResources),
            Name = "NoteViewModel_ParentType_Name")]
        public string ParentType { get; set; }

         [HiddenInput(DisplayValue = false)]
         [Display(ResourceType = typeof(ViewModelResources),
            Name = "NoteViewModel_ParentTypeId_Name")]
        public long? ParentTypeId { get; set; }
    }
}