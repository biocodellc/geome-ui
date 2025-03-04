import { AfterViewInit, Component, inject, OnDestroy, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../../../helpers/services/user.service';
import { ProjectService } from '../../../../../helpers/services/project.service';
import { NgbDropdown, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, debounceTime, Subject, take, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-add-member',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbDropdownModule, RouterLink],
  templateUrl: './add-member.component.html',
  styleUrl: './add-member.component.scss'
})
export class AddMemberComponent implements AfterViewInit, OnDestroy{
  // Injectors
  toastr = inject(ToastrService);
  userService = inject(UserService);
  projectService = inject(ProjectService);

  // Variables
  @ViewChild('userDropdown') userDropdown!: NgbDropdown;
  destroy$: Subject<any> = new Subject();
  searchUserSub:BehaviorSubject<any> = new BehaviorSubject('');
  userList: Array<any> = [];
  filteredUserList: Array<any> = [];
  currentProject: any;
  selectedUser:any;
  searchUser:string = '';
  isLoading:boolean = false;

  emailReg:RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  constructor() {
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.currentProject = res;
      if(this.currentProject) this.getAllUsers();
    })
    this.searchUserSub.pipe(takeUntil(this.destroy$), debounceTime(400)).subscribe(()=> this.filterUser());
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.userDropdown.autoClose = 'outside';
      // this.userDropdown.openChange.subscribe((res:any)=>{
      //   console.log(res);
      // })
    }, 1000);
  }

  getAllUsers() {
    if (this.userList.length) return;
    this.userService.getUserData().pipe(take(1), takeUntil(this.destroy$))
      .subscribe((res: any) => this.userList = this.filteredUserList = res);
  }

  onUserSelect(user: any) {
    this.userDropdown.close();
    this.selectedUser = user;
  }

  filterUser(){
    const val = this.searchUser.trim().toLowerCase();
    console.log(val);
    if(val){
      const filteredUsers = this.userList.filter((user:any)=>
        user.username.toLowerCase().includes(val) ||
        user.email.toLowerCase().includes(val) ||
        user.firstName.toLowerCase().includes(val) ||
        user.lastName.toLowerCase().includes(val)
      );
      this.filteredUserList = [...filteredUsers];
    }
    else this.filteredUserList = [...this.userList];
  }

  sendInvite(){
    const val = this.searchUser.trim();
    const filteredUsers = this.userList.filter((user:any)=>
      user.username.toLowerCase().includes(val) ||
      user.email.toLowerCase().includes(val) ||
      user.firstName.toLowerCase().includes(val) ||
      user.lastName.toLowerCase().includes(val)
    );
    if(filteredUsers.length) return;
    else if(!this.emailReg.test(val)){
      this.toastr.error('Invalid Email Format!');
      return;
    }
    this.isLoading = true;
    const data = { email: val, projectId: this.currentProject.projectId };
    this.userService.invite(data).pipe(take(1), takeUntil(this.destroy$)).subscribe((res:any)=>{
      if(res.success) this.toastr.success('Invitation Sent!');
      this.isLoading = false;
      this.searchUser = '';
      this.filterUser();
      this.userDropdown.close();
    })
  }

  addUser(){
    this.isLoading = true;
    this.projectService.addMember(this.currentProject.projectId, this.selectedUser.username)
    .pipe(take(1), takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.toastr.success('User Added Successfully!');
      this.isLoading = false;
      this.selectedUser = null;
      this.searchUser = '';
    })
  }

  inviteUser(){
    
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}
