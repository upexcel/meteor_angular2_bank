import {
    Component,
    OnInit,
    OnDestroy
} from '@angular/core';
import {
    Mongo
} from 'meteor/mongo';
import {
    Meteor
} from 'meteor/meteor';
import {
    Router
} from '@angular/router';
// *** new pattern***
import {
    Observable
} from 'rxjs/Observable';
import {
    Subscription
} from 'rxjs/Subscription';
import {
    MeteorObservable
} from 'meteor-rxjs';
import * as _ from 'lodash';
import {
    Csvdata,
    Head,
    Productcategory,
    Accounts_no
} from '../../../../../../both/collections/csvdata.collection';
import {
    accounting
} from 'meteor/iain:accounting';
import template from './reportbycategory.html';

@Component({
    selector: 'reportbycategory',
    template
})

export class ReportByCategoryComponent implements OnInit, OnDestroy {
    csvdata1: Observable < any[] > ;
    csvdata: any;
    csvSub: Subscription;

    account_code: any;// use for showing last 4 digit of account


    categoryfound: any;
    categoryobservable: Observable < any[] > ;
    categorylist: any;
    categorySub: Subscription;
    
    monthwiselist: any;
    monthwisetotal: any;
    selectedcategory: any;

    accountlist: Observable < any[] > ;
    accountSub: Subscription;
    accountlistdata: any;

    loading: boolean= false;
    expense_id: any;
    headreport: Observable < any[] > ;
    headlist: any;
    headSub: Subscription;
    headname: any;
    month: string[] = ["January","February","March","April","May","June","July","August","September","October","November","December"]; 
      
    constructor(private _router: Router) {}

    ngOnInit() {
        this.csvSub = MeteorObservable.subscribe('csvdata').subscribe();
        this.headSub = MeteorObservable.subscribe('headlist').subscribe();
        this.accountSub = MeteorObservable.subscribe('Accounts_no').subscribe();
        //**** time limit check condition
        if (localStorage.getItem("login_time")) {
            var login_time = new Date(localStorage.getItem("login_time"));
            var current_time = new Date();
            var diff = (current_time.getTime() - login_time.getTime()) / 1000;
            if (diff > 3600) {
                console.log("Your session has expired. Please log in again");
                var self = this;
                localStorage.removeItem('login_time');
                localStorage.removeItem('Meteor.loginToken');
                localStorage.removeItem('Meteor.loginTokenExpires');
                localStorage.removeItem('Meteor.userId');
                Meteor.logout(function(error) {
                    if (error) {
                        console.log("ERROR: " + error.reason);
                    } else {
                        self._router.navigate(['/login']);
                    }
                });
            }
        }
        this.headreport = Head.find({ });
        this.headreport.subscribe((data) => {
            this.headlist=data;
        })
        this.accountlist = Accounts_no.find({}).zone();
        this.accountlist.subscribe((data) => {
             this.accountlistdata=data;
             console.log(this.accountlistdata);
        });
        this.categoryobservable = Productcategory.find({}).zone();
        this.categorySub = MeteorObservable.subscribe('Productcategory').subscribe();
        this.categoryobservable.subscribe((data) => {
            this.categorylist = data;
        });    
    }
       
        searchhead(selectedbyuser){
            this.selectedcategory=selectedbyuser;
            console.log(this.selectedcategory);
            this.startsearchreportbycategory();
        }
        startsearchreportbycategory(){
          var sort_order = {};
          sort_order["Txn_Posted_Date"] = -1;
          console.log(this.selectedcategory._id);
          this.loading = true;             
                this.csvdata1 = Csvdata.find({
                    "Assigned_parent_id": this.selectedcategory._id
                }, {
                    sort: sort_order
                }).zone();
                this.monthwiselist=null;
                this.csvdata1.subscribe((data1) => {
                    this.csvdata = data1;
                    var monthlist = {};
                    var monthtotal = {};
                    for (let i = 0; i < this.csvdata.length; i++) {
                        var item = this.csvdata[i];
                        var d = new Date(item["Txn_Posted_Date"]);
                        var year = d.getFullYear();
                        var month_value = d.getMonth();
                        this.categoryfound = _.filter(this.categorylist, {
                                 "_id": item["Assigned_parent_id"]
                         });
                        item["Assigned_Category"]=this.categoryfound[0]? this.categoryfound[0].category: 'Not Assigned';
                        var key = this.month[month_value] + '-' + year;
                        if (!monthlist[key]) {
                            monthlist[key] = [];
                        }
                        if(!monthtotal[key]){
                          monthtotal[key]=0;
                        }
                        monthlist[key].push(item);
                        monthtotal[key]+= Math.round(accounting.unformat(item["Transaction_Amount(INR)"])*100)/100;
                    }
                    var list = [];
                    _.forEach(monthlist, function(value, key) {
                        list.push({
                            "key": key,
                            "value": value
                        })
                    })
                    this.loading=false;
                    this.monthwisetotal=monthtotal;
                    this.monthwiselist = list;
                });
         setTimeout(function() {
            this.loading = false;
        }, 10000);
        }

    monthtotalformat(months) {
        return accounting.formatNumber(this.monthwisetotal[months], " ");
    }

    accountprint(id){
        this.account_code = _.filter(this.accountlistdata, {
                    "_id": id
             });
         console.log(this.account_code);
         return this.account_code[0]? this.account_code[0].Account_no.slice(-4): "processing";
    }

    headnamebyid(id){
         this.headname = _.filter(this.headlist,{
             "_id": id
         });
         return this.headname[0]? this.headname[0].head: "not assigned";
    }

     printfunction(){
        window.print();
    }

    ngOnDestroy() {
        this.csvSub.unsubscribe();
        this.headSub.unsubscribe();
    }
}