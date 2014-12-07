using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Web;
using System.Web.Mvc;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Inventory.DAL;
using Inventory.MVC.Extensions;
using Inventory.MVC.Models;
using Kendo.Mvc.Extensions;
using Kendo.Mvc.UI;
using Microsoft.AspNet.SignalR;
using StructureMap;
using SignalRLocalHub.Hubs;

namespace Inventory.MVC.Infrastructure
{
    public static class Utils
    {
        

         public static TViewModelType CreateBase<TEntityType, TViewModelType>(TViewModelType viewModel, string clientConnectionId =  null) where TEntityType : class
         {
             using (InventoryContext context = new InventoryContext())
             {
                 if (viewModel != null)
                 {
                     var entity = Mapper.Map<TEntityType>(viewModel);
                     context.Set<TEntityType>().Add(entity);
                     context.SaveChanges();
                     // Това се прави за да може да се покаже в UI новите стойности, които са автоматично генерирани от базата, като Id, например
                     viewModel = Mapper.Map<TViewModelType>(entity);


                     if (!string.IsNullOrEmpty(clientConnectionId))
                     {
                         var hubContext = GlobalHost.ConnectionManager.GetHubContext<CrudHub>();
                         string messageType = Enum.GetName(typeof (KendoNotificationTypes),
                             KendoNotificationTypes.success);

                         hubContext.Clients.Client(clientConnectionId).showNotificationMessage("Успешно създаден " + viewModel.ToString() + "!",
                             messageType);
                     }

                 }


                 return viewModel;
             }
         }

         public static IEnumerable<TViewModelType> ReadBase<TEntityType, TViewModelType>() where TEntityType : class
         {
             using (InventoryContext context = new InventoryContext())
             {
                 var viewModels = context.Set<TEntityType>().AsQueryable().Project().To<TViewModelType>().ToList();
                 //Expression<Func<ViewModelBase, bool>> exp = null
                 //var viewModels = context.Set<TEntityType>().Where(exp).Cast<TEntityType>().AsQueryable().Project().To<TViewModelType>().ToList();

                 return viewModels;
             }
         }

         public static TViewModelType UpdateBase<TEntityType, TViewModelType>(TViewModelType viewModel) where TEntityType : class
         {
             if (viewModel != null)
             {
                 using (InventoryContext context = new InventoryContext())
                 {
                     var entity = context.Set<TEntityType>().Find((viewModel as ViewModelBase).Id);

                     Mapper.Map(viewModel, entity);

                     context.SaveChanges();
                     // Това се прави за да може да се покаже в UI новите стойности, които са автоматично генерирани от базата, като Id, например
                     var updatedViewModel = Mapper.Map<TViewModelType>(entity);
                     return updatedViewModel;

                 }
             }
             return default(TViewModelType);
         }

         public static TViewModelType DeleteBase<TEntityType, TViewModelType>(TViewModelType viewModel) where TEntityType : class
         {
             using (InventoryContext context = new InventoryContext())
             {
                 var entity = context.Set<TEntityType>().Find((viewModel as ViewModelBase).Id);

                 context.Set<TEntityType>().Remove(entity);

                 context.SaveChanges();
             }

             return viewModel;
         }
    }
}