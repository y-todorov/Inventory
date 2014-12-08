using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Inventory.MVC.Attributes
{
    public class YordanModelBinder : DefaultModelBinder
    {
        protected override object CreateModel(ControllerContext controllerContext, ModelBindingContext bindingContext, Type modelType)
        {
            //var typeValue = bindingContext.ValueProvider.GetValue(bindingContext.ModelName + ".ModelType");
            //var type = Type.GetType(
            //    (string)typeValue.ConvertTo(typeof(string)),
            //    true
            //);
            //var model = Activator.CreateInstance(type);
            //bindingContext.ModelMetadata = ModelMetadataProviders.Current.GetMetadataForType(() => model, type);
            //return model;

            var model = Activator.CreateInstance(modelType);
            bindingContext.ModelMetadata = ModelMetadataProviders.Current.GetMetadataForType(() => model, modelType);
            return model;
        }
    }
}