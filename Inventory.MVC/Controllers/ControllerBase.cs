using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Runtime.Caching;
using System.Web;
using System.Web.Mvc;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Inventory.DAL;
using Inventory.MVC.Models;
using Kendo.Mvc.Extensions;
using Kendo.Mvc.UI;
using System.Threading.Tasks;

namespace Inventory.MVC.Controllers
{
    public class ControllerBase : Controller
    {
        protected override JsonResult Json(object data, string contentType, System.Text.Encoding contentEncoding,
           JsonRequestBehavior behavior)
        {
            JsonResult jr = base.Json(data, contentType, contentEncoding, JsonRequestBehavior.AllowGet);
            jr.MaxJsonLength = int.MaxValue;
            return jr;
        }

        protected override JsonResult Json(object data, string contentType, System.Text.Encoding contentEncoding)
        {
            JsonResult jr = base.Json(data, contentType, contentEncoding, JsonRequestBehavior.AllowGet);
            jr.MaxJsonLength = int.MaxValue;
            return jr;
        }

        public JsonResult ReadBase<TEntityType, TViewModelType>([DataSourceRequest] DataSourceRequest request, IQueryable<TEntityType> query)
        {
            var task = query;
            var viewModels = task.AsQueryable().Project().To<TViewModelType>();
            DataSourceResult dataSourceResult = viewModels.ToDataSourceResult(request);
            JsonResult jresult = Json(dataSourceResult);
            return jresult;
        }

        public JsonResult CreateBase<TEntityType, TViewModelType>([DataSourceRequest] DataSourceRequest request, InventoryContext context, object viewModel) where TEntityType : class
        {
            if (viewModel != null && ModelState.IsValid)
            {
                var entity = Mapper.Map<TEntityType>(viewModel);
                context.Set<TEntityType>().Add(entity);
                context.SaveChanges();
                // Това се прави за да може да се покаже в UI новите стойности, които са автоматично генерирани от базата, като Id, например
                viewModel = Mapper.Map<TViewModelType>(entity);
            }
            return Json(new[] { viewModel }.ToDataSourceResult(request, ModelState));
        }

        public JsonResult UpdateBase<TEntityType, TViewModelType>([DataSourceRequest] DataSourceRequest request, InventoryContext context, TViewModelType viewModel) where TEntityType : class
        {
            if (viewModel != null && ModelState.IsValid)
            {
                var entity = context.Set<TEntityType>().Find((viewModel as ViewModelBase).Id); 

                Mapper.Map(viewModel, entity);

                context.SaveChanges();
                // Това се прави за да може да се покаже в UI новите стойности, които са автоматично генерирани от базата, като Id, например
                viewModel = Mapper.Map<TViewModelType>(entity);
            }
            return Json(new[] { viewModel }.ToDataSourceResult(request, ModelState));
        }
    }
}