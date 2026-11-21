import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Job } from '../../../core/models/domain.models';
import { LabelPipe } from '../../pipes/labels.pipes';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-job-card',
  standalone: true,
  imports: [RouterLink, IconComponent, LabelPipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let j = job();
    <article class="job card card--hover">
      <div class="job__top">
        <span class="tag">{{ j.industry }}</span>
        @if (j.isFeatured) {
          <span class="tag tag--gold">Featured</span>
        }
      </div>
      <h3 class="job__title">
        <a [routerLink]="['/jobs', j.slug]">{{ j.title }}</a>
      </h3>
      <ul class="job__meta">
        <li><app-icon name="globe" [size]="16" />{{ j.city ? j.city + ', ' : '' }}{{ j.country }}</li>
        <li><app-icon name="briefcase" [size]="16" />{{ j.experience }}</li>
        @if (j.vacancies) {
          <li><app-icon name="users" [size]="16" />{{ j.vacancies }} {{ j.vacancies === 1 ? 'vacancy' : 'vacancies' }}</li>
        }
        @if (j.salary) {
          <li><app-icon name="award" [size]="16" />{{ j.salary }}</li>
        }
      </ul>
      <div class="job__foot">
        <span class="job__date">
          {{ j.employmentType | label }}
          @if (j.applicationDeadline) {
            · Apply by {{ j.applicationDeadline | date: 'd MMM y' }}
          }
        </span>
        <a [routerLink]="['/jobs', j.slug]" class="link-arrow" [attr.aria-label]="'View details and apply for ' + j.title">
          View &amp; apply <app-icon name="arrow" [size]="16" />
        </a>
      </div>
    </article>
  `,
  styles: `
    :host { display: block; }
    .job { display: flex; flex-direction: column; height: 100%; padding: var(--sp-5); }
    .job__top { display: flex; flex-wrap: wrap; gap: var(--sp-2); margin-bottom: var(--sp-4); }
    .job__title { margin-bottom: var(--sp-4); font-size: 1.125rem; line-height: 1.35; }
    .job__title a { color: var(--navy-900); text-decoration: none; }
    .job__title a::after { content: ''; position: absolute; inset: 0; }
    .job { position: relative; }
    .job__title a:hover { color: var(--gold-600); }
    .job__meta { display: grid; gap: var(--sp-2); margin: 0 0 var(--sp-5); padding: 0; list-style: none; font-size: var(--fs-sm); color: var(--grey-600); }
    .job__meta li { display: flex; align-items: center; gap: var(--sp-2); }
    .job__meta app-icon { color: var(--grey-500); }
    .job__foot {
      display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--sp-2);
      margin-top: auto; padding-top: var(--sp-4); border-top: 1px solid var(--grey-100);
    }
    .job__foot .link-arrow { position: relative; z-index: 1; }
    .job__date { font-size: var(--fs-xs); color: var(--grey-500); }
  `,
})
export class JobCardComponent {
  readonly job = input.required<Job>();
}
