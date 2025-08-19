import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './_components/login/login.component';
import { SignUpComponent } from './_components/sign-up/sign-up.component';
import { HomeComponent } from './_components/home/home.component';
import { FlightsComponent } from './_components/flights/flights.component';
import { NavbarComponent } from './_components/navbar/navbar.component';
import { FooterComponent } from './_components/footer/footer.component';

const routes: Routes = [
  {path:'', redirectTo: 'home', pathMatch: 'full'},
  {path:'home', component:HomeComponent},
  {path:'flights', component:FlightsComponent},
  {path:'flight', redirectTo: 'flights', pathMatch: 'full'},
  {path:'login', component:LoginComponent},
  {path:'signup', component:SignUpComponent},
  {path:'navbar', component:NavbarComponent},
  {path:'footer', component:FooterComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }