import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { BehaviorSubject } from 'rxjs';

export interface Visual {
    nome: string;
    equipado: boolean;
    href: string;
};

@Injectable({
  providedIn: 'root'
})

export class AccountService {
  
  public validaPassagem = false;
  public nome = '';
  public moedas = 0;
  public conquistas = [];
  public configuracoes = [];
  public visuais: Visual[] = [];
  public guardioes = [];
  public tarefas = [];

  constructor(private router: Router, public storage: Storage, private localNotifications: LocalNotifications) {
      this.storage.get('firstTime').then(result=>{
          if(result){
            this.storage.get('nome').then(result=>{
                this.nome = result;
            });
            this.storage.get('moedas').then(result=>{
                this.moedas = result;
            });
            this.storage.get('conquistas').then(result=>{
                this.conquistas = result;
            });
            this.storage.get('configuracoes').then(result=>{
                this.configuracoes = result;
            });
            this.storage.get('visuais').then((result: Visual[])=>{
                this.visuais = result;
            });
            this.storage.get('guardioes').then(result=>{
                this.guardioes = result;
            });
            this.storage.get('tarefas').then(result=>{
                this.tarefas = result;
            });
          }
      });
  }
  
  escolherGuardiao(tipoSelecionado: string, nome: string){
    
    this.storage.set('nome', nome).then(test=>{
        this.storage.get('nome').then(result=>{
            this.nome = result;
        });
    });
    this.storage.get('moedas').then(result=>{
        this.moedas = result;
    });
    this.storage.get('conquistas').then(result=>{
        this.conquistas = result;
    });
    this.storage.get('configuracoes').then(result=>{
        this.configuracoes = result;
    });
    this.storage.get('visuais').then(result=>{
        this.visuais = result;
    });
    this.storage.get('guardioes').then(result=>{
        this.guardioes = result;
        for(var i=0; i<this.guardioes.length; i++){
            if(this.guardioes[i].tipo === tipoSelecionado){
                this.guardioes[i].selecionado = true;
                console.log(this.guardioes[i].tipo + " " + this.guardioes[i].selecionado);
                this.storage.set('guardioes',this.guardioes);
                this.storage.set('firstTime',true);
            }
        }
    });
    this.storage.get('tarefas').then(result=>{
        this.tarefas = result;
    });
    
    this.router.navigate(['/home/cronogram/']);
  }

  verXPGuardiaoEquipado(){
    for(var i=0; i<this.guardioes.length; i++){
        if(this.guardioes[i].selecionado){
            return this.guardioes[i].xp;
        }
    }
    return 0;
  }

  verXPGuardiao(guardiao: string){
    for(var i=0; i<this.guardioes.length; i++){
        if(this.guardioes[i].tipo === guardiao){
            return this.guardioes[i].xp;
        }
    }
    return 0;
  }

  verLvlGuardiao(guardiao: string){
    for(var i=0; i<this.guardioes.length; i++){
        if(this.guardioes[i].tipo === guardiao){
            return this.guardioes[i].lvl;
        }
    }
    return 0;
  }

  verConquistas(){
    var temp = 0;
    for(var i=0; i<this.conquistas.length; i++){
        if(this.conquistas[i].progresso == 1.0){
            temp += 1;
        }
    }
    return temp;
  }

  verificaVisual(visual: string){
    for(var i=0; i<this.visuais.length; i++){
        if(this.visuais[i].nome === visual){
            return true;
        }
    }
    return false;
  }

  comprarVisual(visual: string, valor: number, href: string){
    if(!this.verificaVisual(visual)){
        if(this.moedas >= valor){
            this.moedas = this.moedas - valor;
            this.visuais.push({nome: visual, equipado: false, href: href}); //href: href
            this.atualizarConquistas(2);
            this.storage.set('visuais',this.visuais);
            this.storage.set('conquistas',this.conquistas);
            this.storage.set('moedas', this.moedas);
            return 'Comprado com Sucesso!';
        }else{
            return 'Sem dinheiro para comprar!';
        }
    }else{
        return 'Voce ja tem este visual!';
    }
  }

  atualizarConquistas(tipo: number){
    for(var i=0; i<this.conquistas.length; i++){
        if(this.conquistas[i].tipo == tipo){
            if(this.conquistas[i].progresso < 1.0){
                this.conquistas[i].progresso += 1/this.conquistas[i].tarefas;
            }
        }
    }
  }

  verificarGuardiao(guardiao: string){
    for(var i=0; i<this.guardioes.length; i++){
        if(this.guardioes[i].tipo === guardiao){
            if(this.guardioes[i].selecionado){
                return true;
            }
        }
    }
    return false;
  }
  
  verGuardiaoEquipado(){
    for(var i=0; i<this.guardioes.length; i++){
        if(this.guardioes[i].selecionado){
            return this.guardioes[i].tipo;
        }
    }
    return false;
  }

  reescolherGuardiao(guardiao: string){
    for(var i=0; i<this.guardioes.length; i++){
        if(this.guardioes[i].tipo === guardiao){
            this.guardioes[i].selecionado = true;
        }else{
            this.guardioes[i].selecionado = false;
        }
    }
    this.storage.set('guardioes',this.guardioes);
  }
  
  criarEvento(title: string, desc: string, startTime: Date, endTime: Date, allDay: boolean){
      this.tarefas.push({title: title, desc: desc, startTime: startTime, endTime: endTime, allDay: allDay});
      
      this.storage.get('tarefas').then(result=>{
        var taskID:number = result.length;
        this.localNotifications.schedule({
            id: taskID,
            smallIcon: 'res://calendar',
            text: (''+title+'\n'+desc),
            sound: this.configuracoes[1].ativado ? 'file://sound.mp3' : null,
            vibrate: this.configuracoes[0].ativado,
            trigger: {at: endTime},
            foreground: true,
            led: {color: 'FF00FF', on: 500, off: 500},
            actions: [{
                        id: 'completar',
                        title: 'Completar'
                        },
                        {
                        id: 'cancelar',
                        title: 'Cancelar'
                        }]
        });
        this.localNotifications.on('completar').subscribe(notification => {
            this.completarEventoPorID(taskID);
        });
        this.localNotifications.on('cancelar').subscribe(notification => {
            this.removerEventoPorID(taskID);
        });
        
        this.storage.set('tarefas',this.tarefas);
      });
      
  }
  
  removerNotificacao(id: number){
      this.localNotifications.cancel(id);
  }
  
  removerEventoPorID(posicao: number){
      this.tarefas.splice(posicao,1);
      this.storage.set('tarefas',this.tarefas).then(); //result=>{this.myCal.loadEvents();}
  }
  
  completarEventoPorID(posicao: number){
      var tmp:number;
      var txt:string;
      txt = this.tarefas[posicao].split('->')[0];
      console.log(txt);
      if(txt === 'Personal'){
          this.guardioes[0].xp += 0.1;
          this.moedas += 50;
          tmp = this.verConquistas();
          this.atualizarConquistas(3);
          if(this.verConquistas() > tmp){
              this.guardioes[0].xp += 0.3;
              this.moedas += 100;
          }
          if(this.guardioes[0].xp >= 1.0){
              this.guardioes[0].xp = 0.0;
              this.guardioes[0].lvl += 1;
          }
      }else{
          if(txt === 'Mentor'){
              this.guardioes[1].xp += 0.1;
              this.moedas += 50;
              tmp = this.verConquistas();
              this.atualizarConquistas(4);
              if(this.verConquistas() > tmp){
                  this.guardioes[1].xp += 0.3;
                  this.moedas += 100;
              }
              if(this.guardioes[1].xp >= 1.0){
                   this.guardioes[1].xp = 0.0;
                   this.guardioes[1].lvl += 1;
              }
          }else{
              if(txt === 'Dieta'){
                    this.guardioes[2].xp += 0.1;
                    this.moedas += 50;
                    tmp = this.verConquistas();
                    this.atualizarConquistas(5);
                    if(this.verConquistas() > tmp){
                        this.guardioes[2].xp += 0.3;
                        this.moedas += 100;
                    }
                    if(this.guardioes[2].xp >= 1.0){
                        this.guardioes[2].xp = 0.0;
                        this.guardioes[2].lvl += 1;
                    }
               }else{
                    if(txt === 'Produtividade'){
                        this.guardioes[3].xp += 0.1;
                        this.moedas += 50;
                        tmp = this.verConquistas();
                        this.atualizarConquistas(6);
                        if(this.verConquistas() > tmp){
                            this.guardioes[3].xp += 0.3;
                            this.moedas += 100;
                        }
                        if(this.guardioes[3].xp >= 1.0){
                            this.guardioes[3].xp = 0.0;
                            this.guardioes[3].lvl += 1;
                        }
                    }else{
                        console.log('Erro');
                    }
                }
            }
        }
      this.atualizarConquistas(1);
      this.storage.set('guardioes',this.guardioes);
      this.storage.set('moedas',this.moedas);
      this.storage.set('conquistas',this.conquistas);
      this.removerEventoPorID(posicao);
  }
  //
  obterNome(){
    var tempNome: string='';
    if(this.nome.split(' ').length > 0 && this.nome.split(' ').length < 2){
        tempNome += this.nome.split(' ')[0].charAt(0).toUpperCase();
    }

    if(this.nome.split(' ').length > 1){
        tempNome += this.nome.split(' ')[0].charAt(0).toUpperCase() + this.nome.split(' ')[1].charAt(0).toUpperCase();
    }
    return tempNome;
  }
  
  completarEvento(event){
      var resultados = [];
      var tmp:number;
      
      for(var i=0; i<this.tarefas.length; i++){
          if(this.tarefas[i] === event){
              var txt:string;
              txt = event.title.split('->')[0];
              console.log(txt);
              if(txt === 'Personal'){
                  this.guardioes[0].xp += 0.1;
                  this.moedas += 50;
                  tmp = this.verConquistas();
                  this.atualizarConquistas(3);
                  if(this.verConquistas() > tmp){
                      resultados['conquista'] = true;
                      this.guardioes[0].xp += 0.3;
                      this.moedas += 100;
                  }
                  if(this.guardioes[0].xp >= 1.0){
                      this.guardioes[0].xp = 0.0;
                      this.guardioes[0].lvl += 1; 
                  }
              }else{
                  if(txt === 'Mentor'){
                      this.guardioes[1].xp += 0.1;
                      this.moedas += 50;
                      tmp = this.verConquistas();
                      this.atualizarConquistas(4);
                      if(this.verConquistas() > tmp){
                          resultados['conquista'] = true;
                          this.guardioes[1].xp += 0.3;
                          this.moedas += 100;
                      }
                      if(this.guardioes[1].xp >= 1.0){
                          this.guardioes[1].xp = 0.0;
                          this.guardioes[1].lvl += 1;
                      }
                  }else{
                      if(txt === 'Dieta'){
                          this.guardioes[2].xp += 0.1;
                          this.moedas += 50;
                          tmp = this.verConquistas();
                          this.atualizarConquistas(5);
                          if(this.verConquistas() > tmp){
                              resultados['conquista'] = true;
                              this.guardioes[2].xp += 0.3;
                              this.moedas += 100;
                          }
                          if(this.guardioes[2].xp >= 1.0){
                              this.guardioes[2].xp = 0.0;
                              this.guardioes[2].lvl += 1;
                          }
                      }else{
                          if(txt === 'Produtividade'){
                              this.guardioes[3].xp += 0.1;
                              this.moedas += 50;
                              tmp = this.verConquistas();
                              this.atualizarConquistas(6);
                              if(this.verConquistas() > tmp){
                                  resultados['conquista'] = true;
                                  this.guardioes[3].xp += 0.3;
                                  this.moedas += 100;
                              }
                              if(this.guardioes[3].xp >= 1.0){
                                  this.guardioes[3].xp = 0.0;
                                  this.guardioes[3].lvl += 1;
                              }
                          }else{
                              console.log('Erro');
                          }
                      }
                  }
              }
          }
      }
      this.atualizarConquistas(1);
      this.storage.set('guardioes',this.guardioes);
      this.storage.set('moedas',this.moedas);
      this.storage.set('conquistas',this.conquistas);
      return resultados;
  }
  
  obterConquista(numero: number){
    for(var i=0; i<this.conquistas.length; i++){
        if(i == numero){
            return this.conquistas[i].progresso;
        }
    }
  }
  
  obterVisualDoGuardiao(guardiao: string){
      var tmp:string = '';
      for(var i=0; i<this.guardioes.length; i++){
          if(this.guardioes[i].tipo === guardiao){
              tmp = this.guardioes[i].href;
          }
      }
      return tmp;
  }
  
}
