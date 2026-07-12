import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResumeScreen } from './resume-screen';

describe('ResumeScreen', () => {
  let fixture: ComponentFixture<ResumeScreen>;
  let component: ResumeScreen;

  /**
   * Crée le composant avec le characterId donné.
   * Les input() sont des signaux en lecture seule : on utilise setInput()
   * sur le componentRef pour les définir avant detectChanges().
   */
  async function createWithCharacterId(
    characterId: string,
  ): Promise<{ component: ResumeScreen; fixture: ComponentFixture<ResumeScreen> }> {
    await TestBed.configureTestingModule({
      imports: [ResumeScreen],
    }).compileComponents();

    const f = TestBed.createComponent(ResumeScreen);
    f.componentRef.setInput('characterId', characterId);
    f.detectChanges();
    return { component: f.componentInstance, fixture: f };
  }

  it('doit créer le composant', async () => {
    ({ component, fixture } = await createWithCharacterId('mario'));
    expect(component).toBeTruthy();
  });

  it('doit afficher le nom et l\'emoji de Mario pour characterId="mario"', async () => {
    ({ component, fixture } = await createWithCharacterId('mario'));

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.character-emoji')?.textContent).toContain('🍄');
    expect(compiled.querySelector('.resume-title')?.textContent).toContain('Mario');
  });

  it('doit afficher le nom et l\'emoji de Luigi pour characterId="luigi"', async () => {
    ({ component, fixture } = await createWithCharacterId('luigi'));

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.character-emoji')?.textContent).toContain('🌿');
    expect(compiled.querySelector('.resume-title')?.textContent).toContain('Luigi');
  });

  it('doit afficher le nom et l\'emoji de Peach pour characterId="peach"', async () => {
    ({ component, fixture } = await createWithCharacterId('peach'));

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.character-emoji')?.textContent).toContain('👑');
    expect(compiled.querySelector('.resume-title')?.textContent).toContain('Peach');
  });

  it('doit afficher le nom et l\'emoji de Daisy pour characterId="daisy"', async () => {
    ({ component, fixture } = await createWithCharacterId('daisy'));

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.character-emoji')?.textContent).toContain('🌸');
    expect(compiled.querySelector('.resume-title')?.textContent).toContain('Daisy');
  });

  it('doit afficher un message par défaut quand characterId est invalide', async () => {
    ({ component, fixture } = await createWithCharacterId('inconnu'));

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.resume-title')?.textContent).toContain('l\'aventurier');
    expect(compiled.querySelector('.character-emoji')?.textContent).toContain('🌟');
  });

  it('doit émettre "resume" quand on clique sur le bouton Reprendre', async () => {
    ({ component, fixture } = await createWithCharacterId('mario'));

    let emitted = false;
    component.resume.subscribe(() => {
      emitted = true;
    });

    const compiled = fixture.nativeElement as HTMLElement;
    const resumeButton = compiled.querySelector<HTMLButtonElement>('.btn-resume');
    resumeButton?.click();
    fixture.detectChanges();

    expect(emitted).toBe(true);
  });

  it('doit émettre "newGame" quand on clique sur le bouton Recommencer', async () => {
    ({ component, fixture } = await createWithCharacterId('mario'));

    let emitted = false;
    component.newGame.subscribe(() => {
      emitted = true;
    });

    const compiled = fixture.nativeElement as HTMLElement;
    const newGameButton = compiled.querySelector<HTMLButtonElement>('.btn-new-game');
    newGameButton?.click();
    fixture.detectChanges();

    expect(emitted).toBe(true);
  });

  it('doit avoir un rôle ARIA "main" sur le conteneur', async () => {
    ({ component, fixture } = await createWithCharacterId('mario'));

    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('[role="main"]');
    expect(container).toBeTruthy();
  });

  it('doit avoir un label ARIA "Reprise de partie" sur le conteneur', async () => {
    ({ component, fixture } = await createWithCharacterId('mario'));

    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('[role="main"]');
    expect(container?.getAttribute('aria-label')).toBe('Reprise de partie');
  });

  it('doit marquer l\'emoji comme décoratif avec aria-hidden', async () => {
    ({ component, fixture } = await createWithCharacterId('mario'));

    const compiled = fixture.nativeElement as HTMLElement;
    const emoji = compiled.querySelector('.character-emoji');
    expect(emoji?.getAttribute('aria-hidden')).toBe('true');
  });

  it('doit afficher le sous-titre sur la progression sauvegardée', async () => {
    ({ component, fixture } = await createWithCharacterId('mario'));

    const compiled = fixture.nativeElement as HTMLElement;
    const subtitle = compiled.querySelector('.resume-subtitle');
    expect(subtitle).toBeTruthy();
    expect(subtitle?.textContent).toContain('sauvegardée');
  });
});
