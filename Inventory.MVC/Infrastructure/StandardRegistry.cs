using System.Data.Entity;
using Inventory.MVC.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using StructureMap.Configuration.DSL;
using StructureMap.Graph;

namespace Inventory.MVC.Infrastructure

{
    public class StandardRegistry : Registry
    {
        public StandardRegistry()
        {
            //For<IUserStore<ApplicationUser>>()
            For(typeof (IUserStore<ApplicationUser>)).Use(typeof (UserStore<ApplicationUser>));
            For(typeof (DbContext)).Use(typeof (ApplicationDbContext));
            //For(typeof(RecipiesEntities)).Use(typeof(RecipiesEntities));
            //For(typeof(ApplicationDbContext)).Use(typeof(ApplicationDbContext));


            Scan(scan =>
            {
                scan.TheCallingAssembly();
                //scan.AssembliesFromApplicationBaseDirectory();
                scan.WithDefaultConventions();
            });
        }
    }
}