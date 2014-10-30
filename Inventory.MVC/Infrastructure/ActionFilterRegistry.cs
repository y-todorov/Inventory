using System;
using System.Web.Mvc;
using StructureMap;
using StructureMap.Configuration.DSL;

namespace Inventory.MVC.Infrastructure
{
    public class ActionFilterRegistry : Registry
    {
        public ActionFilterRegistry(Func<IContainer> containerFactory)
        {
            For<IFilterProvider>().Use(
                new StructureMapFilterProvider(containerFactory));


            //SetAllProperties(x =>
            //    x.Matching(p =>
            //        p.DeclaringType.CanBeCastTo(typeof(ActionFilterAttribute)) &&
            //        p.DeclaringType.Namespace.StartsWith("FailTracker") &&
            //        !p.PropertyType.IsPrimitive &&
            //        p.PropertyType != typeof(string)));
        }
    }
}