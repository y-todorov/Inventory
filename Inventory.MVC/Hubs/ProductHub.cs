using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Inventory.MVC.Models;
using Microsoft.AspNet.SignalR;
using Inventory.DAL;
using StructureMap;
using Inventory.MVC.Infrastructure;
using Microsoft.AspNet.SignalR.Hubs;

namespace SignalRLocalHub.Hubs
{
    [HubName("crudHub")]
    public class CrudHub : Hub
    {
        public ProductViewModel Create(ProductViewModel product)
        {
            ProductViewModel createdProductViewModel = Utils.CreateBase<Product, ProductViewModel>(product);
            Clients.Others.create(createdProductViewModel);
            return createdProductViewModel;
        }

        public IEnumerable<ProductViewModel> Read()
        {
            var result = Utils.ReadBase<Product, ProductViewModel>().AsEnumerable();
            return result;
        }

        public void Update(ProductViewModel product)
        {
            var updatedProduct = Utils.UpdateBase<Product, ProductViewModel>(product);
            
            Clients.Others.update(updatedProduct);
        }

        public void Destroy(ProductViewModel product)
        {
            var deletedProductViewProduct = Utils.UpdateBase<Product, ProductViewModel>(product);

            Clients.Others.destroy(deletedProductViewProduct);
        }
    }
}