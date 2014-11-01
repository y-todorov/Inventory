using Inventory.MVC.Resources;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Inventory.MVC.Attributes
{
    public class DateDisplayAttributeYordan : DisplayFormatAttribute
    {
        public DateDisplayAttributeYordan()
        {
            this.ApplyFormatInEditMode = true;
            this.ConvertEmptyStringToNull = true;
            this.DataFormatString = ViewModelResources.DateFormatString;
            this.HtmlEncode = true;
            this.NullDisplayText = "";
        }
    }
}