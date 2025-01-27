import { Component, Input, OnInit } from '@angular/core';
import { NotificationsService } from '../../services/notifications.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { OnRegistrationEmployee } from '../../models/OnEmployeeRegistration';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
})
export class NotificationsComponent implements OnInit {
  onRegistrationEmployees: OnRegistrationEmployee[] = [];
  @Input({ required: true }) token = "";

  constructor(private notificationSvc: NotificationsService) { }

  ngOnInit(): void {
    this.notificationSvc.notifications.subscribe((data) => {
      this.onRegistrationEmployees = data.sort((a, b) => a.employeeId - b.employeeId);
    })
  }
  conectar() {
    this.notificationSvc.connect(this.token);
  }
  desconectar() {
    this.notificationSvc.disconnect();
  }
}
