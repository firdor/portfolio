import { Component, ViewChild, OnInit } from "@angular/core";
import { ChartComponent } from "ng-apexcharts";
import { Observable, Subject, interval, timer } from 'rxjs';
import { startWith, switchMap, timeInterval, take, map } from 'rxjs/operators'

import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart
} from "ng-apexcharts";

import { Coin } from "./coin";
import { CoinService } from "./coin.service";

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'portfolio';

  @ViewChild("chart", {static: false}) chart: ChartComponent;

  public chartOptions: Partial<ChartOptions>;

  public coins: Coin[] = [];

  public coins$: Observable<Coin[]>;

  public totalInvestment: number = 0;

  public totalValue: number = 0;

  public totalChangeEur: number = 0;

  public totalChangePer: number = 0;

  public countdown: number = 59;
  
  constructor(private coinService: CoinService) {}

  ngOnInit() {
    let first: boolean = true;
   
    this.chartOptions = {
      series: [],
      chart: {
        width: 380,
        type: "pie",
        animations: {
          enabled: true
        }
      },
      labels: [],
      responsive: [
        {
          breakpoint: 480,
          options: {
            /*
            chart: {
              width: 200
            },
            */
            legend: {
              position: "bottom"
            }
          }
        }
      ]
    };

    // 1 second
    const intervalCountdown$ = interval(1000);
    // 1 minute
    const intervalUpdate$ = interval(60000);

    intervalCountdown$.subscribe(val => {
      let time = val % 60;
      this.countdown = 59 - time;
    });

    intervalUpdate$.pipe(
      startWith(0),
      switchMap(() => this.coinService.getCoins())
    ).subscribe((coins) => {
      this.coins = coins;
      if(!first) {
        this.chartOptions.chart.animations.enabled = false;
      }
      this.updateChart();
      this.totalInvestment = this.getTotalInvestment();
      this.totalValue = this.getTotalValue();
      this.updateTotalChange();
      first = false;
    });
  }

  private updateChart() {
    this.chartOptions.series = this.getChartPercantages();
    this.chartOptions.labels = this.getChartLabels();
  }

  private updateTotalChange() {
    this.totalChangeEur = this.totalValue - this.totalInvestment;
    if( this.totalInvestment > 0 ) {
      this.totalChangePer = this.totalChangeEur / this.totalInvestment * 100;
    } else {
      this.totalChangePer = 0;
    }
  }

  private getTotalValue() : number {
    let totalValue : number = 0;
    this.coins.forEach((coin) => {
      totalValue += Number(coin.value);
    });
    return totalValue;
  }

  private getTotalInvestment() : number {
    let totalInvestment : number = 0;
    this.coins.forEach((coin) => {
      totalInvestment += Number(coin.investment);
    });
    return totalInvestment;
  }

  private getChartPercantages() : number[] {
    let percantages : number[] = [];
    this.coins.forEach((coin) => {
      percantages.push(Number(coin.percentage));
    });
    return percantages;
  }

  private getChartLabels() : string[] {
    let labels : string[] = [];
    this.coins.forEach((coin) => {
      labels.push(coin.name);
    });
    return labels;
  }
}
