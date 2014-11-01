using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Inventory.MVC.ModelBinders
{
    public class YordanDateTimeModelBinder : DefaultModelBinder
    {
        public override object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
        {
            // F: "dd MMMM yyyy 'г.' HH:mm:ss 'ч.'",
            // Това е проблема! При клиента е този формат от Globalize.js а НЕ трябва да има ч. накрая !!! Ебаси тегаватото!





            var displayFormat = bindingContext.ModelMetadata.DisplayFormatString;
            var value = bindingContext.ValueProvider.GetValue(bindingContext.ModelName);

            var correctedStringDate = value.AttemptedValue.Replace("ч.", "").Trim();
            correctedStringDate = correctedStringDate.Replace("'ч.'", "").Trim();
            //DateTime date;
            //displayFormat = displayFormat.Replace("{0:", string.Empty).Replace("}", string.Empty);
            //// use the format specified in the DisplayFormat attribute to parse the date
            //if (DateTime.TryParseExact(value.AttemptedValue, displayFormat, CultureInfo.InvariantCulture, DateTimeStyles.None, out date))
            DateTime result;
            if (DateTime.TryParse(correctedStringDate, out result))
            {
                return result;
            }
            else
            {
                bindingContext.ModelState.AddModelError(
                    bindingContext.ModelName,
                    string.Format("{0} is an invalid date format", value.AttemptedValue)
                );
            }


            return base.BindModel(controllerContext, bindingContext);
        }
    }
}