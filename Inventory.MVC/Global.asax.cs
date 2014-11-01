using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using Inventory.MVC.Infrastructure;
using Inventory.MVC.Infrastructure.Tasks;
using Inventory.MVC.ModelBinders;
using StructureMap;

namespace Inventory.MVC
{
    public class MvcApplication : System.Web.HttpApplication
    {
        public IContainer TheContainer
        {
            get
            {
                return (IContainer)HttpContext.Current.Items["_Container"];
            }
            set
            {
                HttpContext.Current.Items["_Container"] = value;
            }
        }

        protected void Application_Start()
        {
            //System.Web.Mvc.ModelBinders.Binders.Add(typeof(DateTime?), new YordanDateTimeModelBinder()); // Като се каже save от клиента тогава минаваме от тук.

            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            AutoMapperConfig.Execute();

            //DependencyResolver.SetResolver(new NinjectDependencyResolver(new StandardKernel()));
            DependencyResolver.SetResolver(
                           new StructureMapDependencyResolver(() => TheContainer ?? ObjectFactory.Container));

            ObjectFactory.Configure(cfg =>
            {
                cfg.AddRegistry(new StandardRegistry());
                cfg.AddRegistry(new ControllerRegistry());
                cfg.AddRegistry(new ActionFilterRegistry(
                    () => TheContainer ?? ObjectFactory.Container));
                cfg.AddRegistry(new MvcRegistry());
                cfg.AddRegistry(new TaskRegistry());
            });

            using (var container = ObjectFactory.Container.GetNestedContainer())
            {
                foreach (var task in container.GetAllInstances<IRunAtInit>())
                {
                    task.Execute();
                }

                foreach (var task in container.GetAllInstances<IRunAtStartup>())
                {
                    task.Execute();
                }
            }
            
        }
    }
}
