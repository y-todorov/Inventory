using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using PCloud.NET;
using System.IO;
using Inventory.MVC.Models;

namespace Inventory.MVC.Controllers
{
    public class DocumentController : Controller
    {
        // GET: Document
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult GetFolders(string id)
        {
            List<DirectoryInfo> dirs;
            if (string.IsNullOrEmpty(id))
            {
                DirectoryInfo di = new DirectoryInfo(@"C:\");
                dirs = new List<DirectoryInfo>() {di};
            }
            else
            {
                dirs = Directory.GetDirectories(id).Select(s => new DirectoryInfo(s)).ToList();
            }

            List<DirectoryViewModel> dvms = new List<DirectoryViewModel>();

            foreach (DirectoryInfo di in dirs)
            {
                bool hasChildren = false;
                try
                {
                    hasChildren = Directory.GetDirectories(di.FullName).Length != 0;
                }
                catch (Exception ex)
                {
                }
                dvms.Add(new DirectoryViewModel
                {
                    id = di.FullName,
                    Name = di.Name,
                    FullName = di.FullName,
                    hasChildren = hasChildren
                });
            }


            //var res = dirs.Select(d => new DirectoryViewModel
            //{
            //    id = d.FullName,
            //    Name = d.Name,
            //    FullName = d.FullName,
            //    hasChildren = Directory.GetDirectories(d.FullName).Length != 0
            //});

            return Json(dvms, JsonRequestBehavior.AllowGet);


            //var dataContext = new SampleEntities();

            //var employees = from e in dataContext.Employees
            //                where (id.HasValue ? e.ReportsTo == id : e.ReportsTo == null)
            //                select new
            //                {
            //                    id = e.EmployeeID,
            //                    Name = e.FirstName + " " + e.LastName,
            //                    hasChildren = e.Employees1.Any()
            //                };

            //return Json(employees, JsonRequestBehavior.AllowGet);
            return null;
        }
    }
}