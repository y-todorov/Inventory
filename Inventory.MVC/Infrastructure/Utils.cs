using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using StructureMap;

namespace Inventory.MVC.Infrastructure
{
    public static class Utils
    {
         public static IContainer GetContainerFromHttpRequest()
        {
             IContainer container = (IContainer)HttpContext.Current.Items["_Container"];
             return container;

        }
    }
}