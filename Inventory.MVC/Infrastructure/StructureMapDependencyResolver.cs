using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using StructureMap;

namespace Inventory.MVC.Infrastructure
{
    public class StructureMapDependencyResolver : IDependencyResolver
    {
        private readonly Func<IContainer> _containerFactory;

        public StructureMapDependencyResolver(Func<IContainer> containerFactory)
        {
            _containerFactory = containerFactory;
        }

        public object GetService(Type serviceType)
        {
            if (serviceType == null)
            {
                return null;
            }

            IContainer container = _containerFactory();

            object result = null;
            if (serviceType.IsAbstract || serviceType.IsInterface)
            {
                result = container.TryGetInstance(serviceType);
            }
            else
            {
                //try
                //{
                result = container.GetInstance(serviceType);
                //}
                //catch (Exception ex)
                //{

                //}
                //result = container.GetInstance(serviceType); // THIS IS STILL PROBLEMATIC
            }
            return result;
        }

        public IEnumerable<object> GetServices(Type serviceType)
        {
            IContainer container = _containerFactory();
            IEnumerable<object> result = container.GetAllInstances(serviceType)
                .Cast<object>();
            return result;
        }
    }
}