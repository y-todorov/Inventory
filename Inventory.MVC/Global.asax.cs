using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using Inventory.MVC.Controllers;
using Inventory.MVC.CustomModelBinders;
using Inventory.MVC.Infrastructure;
using Inventory.MVC.Infrastructure.Tasks;
//using Inventory.MVC.ModelBinders;
using Inventory.MVC.Models;
using Kendo.Mvc;
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
            if (!SiteMapManager.SiteMaps.ContainsKey("sitemap"))
            {
                SiteMapManager.SiteMaps.Register<XmlSiteMap>("sitemap", sitemap =>
                    sitemap.LoadFrom("~/sitemap.sitemap"));
            }

            ModelBinders.Binders.Add(typeof(DateTime?), new YordanDateTimeModelBinder()); // Като се каже save от клиента тогава минаваме от тук.
            //System.Web.Mvc.ModelBinders.Binders.Add(typeof(ViewModelBase), new MyModelBinder()); // Като се каже save от клиента тогава минаваме от тук.

            //ModelBinders.Binders.DefaultBinder = new MyModelBinder();
            //ModelBinders.Binders.Add(typeof(ViewModelBase), new MyModelBinder());
            

            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            AutoMapperConfig.Execute();


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

        public void Application_BeginRequest()
        {
            TheContainer = ObjectFactory.Container.GetNestedContainer();

            foreach (var task in TheContainer.GetAllInstances<IRunOnEachRequest>())
            {
                task.Execute();
            }
        }

        public void Application_EndRequest()
        {
            try
            {
                foreach (var task in TheContainer.GetAllInstances<IRunAfterEachRequest>())
                {
                    task.Execute();
                }
            }
            finally
            {
                TheContainer.Dispose();
                TheContainer = null;
            }
        }

        void Application_Error(Object sender, EventArgs e)
        {
            // тук не може да се навигира.
            //HttpContext.Current.Response.Clear();

            //var rd = new RouteData();
            ////rd.DataTokens["area"] = "AreaName"; // In case controller is in another area
            //rd.Values["controller"] = "Error";
            //rd.Values["action"] = "NotFound";

            //IController c = new ErrorController();
            //c.Execute(new RequestContext(new HttpContextWrapper(HttpContext.Current), rd));
        }

    }
}
