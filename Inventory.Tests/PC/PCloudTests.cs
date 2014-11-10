using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Xunit;
using PCloud.NET;
using System.IO;

namespace Inventory.Tests.PC
{
    public class PCloudTests : IDisposable
    {
        private PCloudClient pCloud = null;

        private string testFolderRoot;

        private string testFolderName;

        private long testFolderId;

        public PCloudTests() 
        {
            testFolderName = "ApiTestsFromVisualStudio";
            testFolderRoot = "P:\\" + testFolderName;
            pCloud = PCloudClient.CreateClientAsync("ytodorov@ytodorov.com", "").Result;
            if (Directory.Exists(testFolderRoot))
            {
                Directory.Delete(testFolderRoot, true);
            }

            Folder folder = pCloud.CreateFolderAsync(0, testFolderName).Result;
            testFolderId = folder.FolderId;
        }

         public void Dispose()
         {
             pCloud.Dispose();
             if (Directory.Exists(testFolderRoot))
             {
                 Directory.Delete(testFolderRoot, true);
             }
         }

         //[Fact]
         //public void UploadFileTest()
         //{
         //    FileInfo fi = new FileInfo(@"C:\tmp\test.txt");
         //    var file = pCloud.UploadFileAsync(fi.OpenRead(), testFolderId, fi.Name, CancellationToken.None).Result;
         //}
    }
}
