import {
    Component,
    OnInit,
    OnDestroy
} from '@angular/core';
import {
    Router
} from '@angular/router';
import {
    Mongo
} from 'meteor/mongo';
import {
    Meteor
} from 'meteor/meteor';
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
import {
    MeteorComponent
} from 'angular2-meteor';
// ** new pattern end***
// import {
//     MeteorComponent
// } from 'angular2-meteor';
import {
    FormGroup,
    FormBuilder,
    Validators
} from '@angular/forms';
import {
    Productcategory
} from '../../../../both/collections/csvdata.collection';
import template from './addproduct.html';

@Component({
    selector: 'csvaddproduct',
    template
})

export class CsvAddProductComponent extends MeteorComponent implements OnInit, OnDestroy {
    productlist: Observable<any[]>;
    subcategory: Observable<any[]>;
    selectedCategory: Observable<any[]>;
    productSub: Subscription;
    addForm: FormGroup;
    addFormsubcategory: FormGroup;
    selectedCategory: any;
    activateChild: boolean;

    constructor(private formBuilder: FormBuilder, private _router: Router) {
         super();
    }

    onSelect(category: any): void {
        this.selectedCategory = category;
        this.activateChild = true;
        this.subcategory = category.subarray;
    }

        ngOnInit() {

        this.productlist = Productcategory.find({}).zone();
        this.productSub = MeteorObservable.subscribe('Productcategory').subscribe();

        if (!Meteor.userId()) {
            this._router.navigate(['/login']);
        }

        this.addForm = this.formBuilder.group({
            category: ['', Validators.required],
        });

        this.addFormsubcategory = this.formBuilder.group({
            subcategory: ['', Validators.required],
        });

    }
    
    addCategory() {
        if (this.addForm.valid) {
            Productcategory.insert(<Control>this.addForm.value);
            this.addForm.reset();
        }
    }

    addSubCategory(parentCategory_id) {
        if (this.addFormsubcategory.valid) {
            Productcategory.update({
                _id: parentCategory_id
            }, {
                $push: {
                    "subarray": {
                        "subcategory": this.addFormsubcategory.controls['subcategory'].value
                    }
                }
            });
            this.addFormsubcategory.reset();
            this.subcategory=selectedCategory.subarray;

        }
    }

    updateCategory() {
        if (this.addForm.valid) {
            Productcategory.update({
                _id: this.selectedCategory._id
            }, {
                $set: {
                    "category": this.selectedCategory.category
                }
            });
            this.addForm.reset();
            this.selectedCategory = "";
            this.activateChild = false;
        }
    }

    removeCategory(category) {
        Productcategory.remove(category._id);
    }
    removeSubCategory(id, subarraycategoryname) {
        Productcategory.update({
            _id: id
        }, {
            $pull: {
                'subarray': {
                    'subcategory': subarraycategoryname
                }
            }
        });
    }
    ngOnDestroy() {
    this.productSub.unsubscribe();
  }

}