using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Inventory.MVC.Models;

namespace Inventory.MVC.CustomModelBinders
{
    public class MyModelBinder : DefaultModelBinder
    {
        //protected override object CreateModel(ControllerContext controllerContext, ModelBindingContext bindingContext, Type modelType)
        //{
        //    /// MyBaseClass and MyDerievedClass are hardcoded.
        //    /// We can use reflection to read the assembly and get concrete types of any base type
        //    if (modelType.Equals(typeof(ViewModelBase)))
        //    {
        //        Type instantiationType = typeof(NoteViewModel);
        //        var obj = Activator.CreateInstance(instantiationType);
        //        bindingContext.ModelMetadata = ModelMetadataProviders.Current.GetMetadataForType(null, instantiationType);
        //        bindingContext.ModelMetadata.Model = obj;
        //        return obj;
        //    }
        //    return base.CreateModel(controllerContext, bindingContext, modelType);
        //}

        public class DerivedTypeModelBinder : DefaultModelBinder
        {
            protected override object CreateModel(ControllerContext controllerContext, ModelBindingContext bindingContext, Type modelType)
            {
                return base.CreateModel(controllerContext, bindingContext, GetModelType(controllerContext, bindingContext, modelType));
            }
            protected override ICustomTypeDescriptor GetTypeDescriptor(ControllerContext controllerContext, ModelBindingContext bindingContext)
            {
                var modelType = GetModelType(controllerContext, bindingContext, bindingContext.ModelType);
                return new AssociatedMetadataTypeTypeDescriptionProvider(modelType).GetTypeDescriptor(modelType);
            }
            private static Type GetModelType(ControllerContext controllerContext, ModelBindingContext bindingContext, Type modelType)
            {
                if (bindingContext.ValueProvider.ContainsPrefix(bindingContext.ModelName + ".BindingType"))
                {
                    modelType = System.Type.GetType(((string[])bindingContext.ValueProvider.GetValue(bindingContext.ModelName + ".BindingType").RawValue)[0]);
                }
                return modelType;
            }
        }

    }
}