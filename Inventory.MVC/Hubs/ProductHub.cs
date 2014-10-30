using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Inventory.MVC.Models;
using Microsoft.AspNet.SignalR;
using Inventory.DAL;

namespace SignalRLocalHub.Hubs
{
    public class ProductHub : Hub
    {
        //private ProductService productService;

        public ProductHub()
        {
            //productService = new ProductService(new SampleEntities());
        }

        public IEnumerable<ProductViewModel> Read()
        {
            using (InventoryContext context = new InventoryContext())
            {
                var res = context.Products.Project().To<ProductViewModel>().ToList();
                return res;
            }
        }

        public void Update(ProductViewModel product)
        {
            using (InventoryContext context = new InventoryContext())
            {
                var entity = context.Products.Find(product.Id);

                Mapper.Map(product, entity);

                context.SaveChanges();

                Mapper.Map(entity, product);
            }
            
            Clients.Others.update(product);
        }

        public void Destroy(ProductViewModel product)
        {
            using (InventoryContext context = new InventoryContext())
            {
                var entity = context.Products.Find(product.Id);

                context.Products.Remove(entity);

                context.SaveChanges();
            }
            
            Clients.Others.destroy(product);
        }

        public ProductViewModel Create(ProductViewModel product)
        {
            using (InventoryContext context = new InventoryContext())
            {
                var entity = Mapper.Map<Product>(product);
                context.Products.Add(entity);
                context.SaveChanges();
                // Това се прави за да може да се покаже в UI новите стойности, които са автоматично генерирани от базата, като Id, например
                Mapper.Map(entity, product);
            }
            Clients.Others.create(product);

            return product;
        }
    }
}