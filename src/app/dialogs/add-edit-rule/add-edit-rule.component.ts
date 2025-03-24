import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Rule, RULE_LEVELS } from '../../../helpers/models/rules.model';

@Component({
  selector: 'app-add-edit-rule',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-edit-rule.component.html',
  styleUrl: './add-edit-rule.component.scss'
})
export class AddEditRuleComponent {
  // Injectables
  private fb = inject(FormBuilder);
  public activeModal = inject(NgbActiveModal);

  // Variables
  @Input() public modalData:any;
  ruleForm!:FormGroup;
  currentRule!:Rule|any;
  ruleMetaDataKeys:any[] = [];
  formLoaded:boolean = false;
  ruleLevels:string[] = RULE_LEVELS;

  constructor(){
    this.initForm();
    setTimeout(() => {
      if(this.modalData.rule) this.setCurrentRule(this.modalData.rule, true);
    }, 100);
  }

  onRuleTypeChange(val:string){
    const ruleData:Rule = this.modalData.availableRules.find((rule:Rule)=> rule.name == val);
    if(!ruleData) return;
    this.setCurrentRule(ruleData);
  }

  setCurrentRule(rule:Rule, updateValues?:boolean){
    this.currentRule = rule;
    this.ruleMetaDataKeys = this.currentRule.requiredItems;
    this.ruleMetaDataKeys.forEach(control => this.addControl(control, control == 'caseInsensitive' ? true: ''));
    this.formLoaded = true;
    if(updateValues){
      const ruleData:any = { ...rule };
      Object.keys(rule).forEach((control:any) => this.setControlVal(control, ruleData[control]));
    }
  }

  initForm(){
    this.ruleForm = this.fb.group({
      name: ['', Validators.required],
      level: [this.ruleLevels[1], Validators.required]
    })
    this.form['name'].valueChanges.subscribe((val:string) => this.onRuleTypeChange(val))
  }

  SaveRule(){
    this.ruleForm.markAllAsTouched();
    if(this.ruleForm.invalid) return;
    const ruleData = { ...this.ruleForm.value };
    if(ruleData['columns'] && !Array.isArray(ruleData['columns'])) ruleData['columns'] = [ ruleData['columns'] ];
    Object.keys(ruleData).forEach((key:string) => this.currentRule[key] = ruleData[key]);
    this.activeModal.dismiss(this.currentRule);
  }

  clearRuleData(){
    this.ruleMetaDataKeys.forEach(control => this.removeControl(control));
    this.ruleForm.reset();
    this.currentRule = null;
    this.formLoaded = false;
    this.ruleMetaDataKeys = [];
    this.setControlVal('level', this.ruleLevels[1]);
  }

  get form(){ return this.ruleForm.controls; };

  private setControlVal(control:string, val:any){
    if(!val || control == 'requiredItems') return;
    this.form[control].setValue(val);
    this.form[control].updateValueAndValidity();
  }

  private addControl(controlName:string, val:any){
    this.ruleForm.addControl(controlName, this.fb.control(val, Validators.required));
  }

  private removeControl(controlName:string){
    this.ruleForm.removeControl(controlName);
  }
}
