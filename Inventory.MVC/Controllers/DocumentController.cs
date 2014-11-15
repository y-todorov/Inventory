using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Kendo.Mvc.Extensions;
using Kendo.Mvc.UI;
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
                dirs = new List<DirectoryInfo>() { di };
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
            return Json(dvms, JsonRequestBehavior.AllowGet);
        }



        public ActionResult ReadFiles([DataSourceRequest] DataSourceRequest request, string folderFullPath)
        {
            List<FileViewModel> fvms = new List<FileViewModel>();
            try
            {
                if (!string.IsNullOrEmpty(folderFullPath) &&
                    !folderFullPath.ToCharArray().Intersect(Path.GetInvalidPathChars()).Any())
                {
                    DirectoryInfo info = new DirectoryInfo(folderFullPath);

                    var files = Directory.GetFiles(folderFullPath, "*.*", SearchOption.AllDirectories); //.Take(1000);
                    foreach (string file in files)
                    {
                        FileInfo fi = new FileInfo(file);
                        FileViewModel fvm = new FileViewModel()
                        {
                            Id = fi.Name.GetHashCode(),
                            Name = fi.Name,
                            Size = fi.Length,
                            DateCreated = fi.CreationTime
                        };
                        fvms.Add(fvm);
                    }
                }
            }
            catch (Exception ex)
            {

            }

            //return Json(fvms, JsonRequestBehavior.AllowGet); // da fack no, here is not this way!!!

            return Json(fvms.ToDataSourceResult(request));
        }

    }
}