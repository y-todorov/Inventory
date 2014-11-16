using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Kendo.Mvc.UI;
using Kendo.Mvc.UI.Fluent;

namespace Inventory.MVC.Extensions
{
    public static class ChartBuilderExtensions
    {
        public static ChartBuilder<T> ProcessPerformnanceCategory<T>(this ChartBuilder<T> builder) where T : class
        {


            builder.Title("Spain electricity production (GWh)")
                .HtmlAttributes(new {style = "width:100%;height:100%"})
                .Legend(legend => legend
                    .Position(ChartLegendPosition.Top)
                )
                //.RenderAs(RenderingMode.Canvas)
                .Transitions(false)
                .SeriesDefaults(sd => sd.Column().Overlay(ChartBarSeriesOverlay.None))
                .DataSource(dataSource => dataSource
                    .SignalR()
                    .AutoSync(true)
                    .Transport(tr => tr
                        .Promise("hubStart")
                        .Hub("crudHub")
                        .Client(c => c
                            .Read("readProcesses")
                        )
                        .Server(s => s
                            .Read("readProcesses")
                        ))
                )
                .Series(series =>
                {
                    //series.Column(model => model.PagedMemorySize64).Name("PagedMemorySize");
                    //series.Column(model => model.PrivilegedProcessorTime).Name("PrivilegedProcessorTime");
                    //series.Column(model => model.StartTime).Name("StartTime");
                    //series.Column(model => model.HandleCount).Name("HandleCount");
                    //series.Column(model => model.ThreadsCount).Name("ThreadsCount");
                    //series.Column(model => model.WorkingSet64).Name("WorkingSet MBs");

                    //series.Column(model => model.SessionId).Name("SessionId");
                })
                .CategoryAxis(axis => axis
                    .Categories(model => model) // name set here
                    .Labels(labels => labels.Rotation(-90))
                    .MajorGridLines(lines => lines.Visible(true))
                )
                .ValueAxis(axis => axis.Numeric()
                    .Labels(labels => labels.Format("{0:N0}"))
                    //.MajorUnit(10000)
                    .Line(line => line.Visible(false))
                )
                .Tooltip(tooltip => tooltip
                    .Visible(true)
                    .Format("{0:N0}")
                );

             return builder;
        }

    }
}