import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { gsap } from 'gsap';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.scss'],
})
export class IntroComponent implements OnInit {
  @ViewChild('h1Element', { static: true }) h1Element!: ElementRef;
  @ViewChild('buttonElement', { static: true }) buttonElement!: ElementRef;

  ngOnInit(): void {
    const h1 = this.h1Element.nativeElement;
    const words = h1.textContent.split(' ');
    h1.innerHTML = words
      .map((word: any, index: any) => {
        const className = index === 0 ? 'first-word' : 'other-word';
        return `<span class="${className}">${word}</span>`;
      })
      .join(' ');

    const tl = gsap.timeline();

    tl.from('.first-word', { // first word is "hey!"
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: 'power4.out',
    })
      .from(
        '.other-word', // all the other words will have a delay after the first one to give a prettier effect
        {
          delay: 1.2,
          opacity: 0,
          y: 20,
          duration: 0.6,
          ease: 'power4.out',
          stagger: 0.3,
        },
        '-=0.3'
      )
      .from('.notification-container', {
        y: 50,
        opacity: 0,
        duration: 1.2,
        ease: 'power4.out',
      })
      .from(
        '.button',
        {
          y: 50,
          opacity: 0,
          duration: 1.2,
          ease: 'power4.out',
        },
        '-=0.5'
      );

    // handling the hover effect here because it was giving me problems if i used CSS instead
    const button = this.buttonElement.nativeElement;

    button.addEventListener('mouseenter', () => {
      gsap.to(button, {
        scale: 1.1,
        backgroundColor: '#2d2d2d',
        color: '#e9e8e5',
        duration: 0.3,
        ease: 'power2.out',
      });
    });

    button.addEventListener('mouseleave', () => {
      gsap.to(button, {
        scale: 1,
        backgroundColor: '#ceb2ae',
        color: '#e9e8e5',
        duration: 0.3,
        ease: 'power2.out',
      });
    });
  }
}
