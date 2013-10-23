<html>

    <?php include 'inc_head.php'; ?>

    <body>
        <header data-bk-position="fixed" class="ui-bar">
            <h1 style="text-align: center;">
                Situation Economica
            </h1>
        </header>

        <div>
            <div>
                <small>
                    <b>saldo Contabile</b> 
                    <span class="bk-float-right">6.500,00€</span>
                    <br/>
                    <b>Saldo Disponibile</b>
                    <span class="bk-float-right">5.000,00€</span>
                </small>
            </div>

            <ul data-bk-role="tabs" class="account-tabs">
                <li class="active">
                    Movimenti
                </li>
                <li>
                    Disposizioni
                </li>
                <li>
                    Bancomat
                </li>
            </ul>
        </div>
        <div>
            <ul data-bk-role="link-list" class="account-details-list">
                <li>
                    <a href="end.html" 
                       data-bk-link-icon="img/ico_arrow_red_right.png" data-bk-link-icon-hybrid="img/ico_arrow_red_right.png">
                        <span class="amont">-215,00€</span>
                        <span class="negative-amount"></span><b>Addebito Prautorizzato</b>
                        <br/>
                        <span class="date">11/04/2013</span>
                        <span class="clr"></span>
                    </a>
                </li>
                <li>
                    <a href="end.html" 
                       data-bk-link-icon="img/ico_arrow_red_right.png" data-bk-link-icon-hybrid="img/ico_arrow_red_right.png">
                        <span class="amont">-51,00€</span>
                        <span class="negative-amount"></span><b>Pagobancomat Con Carta</b>
                        <br/>
                        <span class="date">15/04/2013</span>
                        <span class="clr"></span>
                    </a>
                </li>
                <li>
                    <a href="end.html" 
                       data-bk-link-icon="img/ico_arrow_red_right.png" data-bk-link-icon-hybrid="img/ico_arrow_red_right.png">
                        <span class="amont">1.045,00€</span>
                        <span class="positive-amount"></span><b>Vostri Emolumenti</b>
                        <br/>
                        <span class="date">16/04/2013</span>
                        <span class="clr"></span>
                    </a>
                </li>
                <li>
                    <a href="end.html" 
                       data-bk-link-icon="img/ico_arrow_red_right.png" data-bk-link-icon-hybrid="img/ico_arrow_red_right.png">
                        <span class="amont">-100,00€</span>
                        <span class="negative-amount"></span><b>BAncomat - Prelevamento Presso Altro Istituto</b>
                        <br/>
                        <span class="date">17/04/2013</span>
                        <span class="clr"></span>
                    </a>
                </li>
                <li>
                    <a href="end.html" 
                       data-bk-link-icon="img/ico_arrow_red_right.png" data-bk-link-icon-hybrid="img/ico_arrow_red_right.png">
                        <span class="amont">-215,00€</span>
                        <span class="negative-amount"></span><b>Addebito Prautorizzato</b>
                        <br/>
                        <span class="date">18/04/2013</span>
                        <span class="clr"></span>
                    </a>
                </li>
                <li>
                    <a href="end.html" 
                       data-bk-link-icon="img/ico_arrow_red_right.png" data-bk-link-icon-hybrid="img/ico_arrow_red_right.png">
                        <span class="amont">-51,00€</span>
                        <span class="negative-amount"></span><b>Pagobancomat Con Carta</b>
                        <br/>
                        <span class="date">19/04/2013</span>
                        <span class="clr"></span>
                    </a>
                </li>
                <li>
                    <a href="end.html" 
                       data-bk-link-icon="img/ico_arrow_red_right.png" data-bk-link-icon-hybrid="img/ico_arrow_red_right.png">
                        <span class="amont">1.045,00€</span>
                        <span class="positive-amount"></span><b>Vostri Emolumenti</b>
                        <br/>
                        <span class="date">20/04/2013</span>
                        <span class="clr"></span>
                    </a>
                </li>
                <li>
                    <a href="end.html" 
                       data-bk-link-icon="img/ico_arrow_red_right.png" data-bk-link-icon-hybrid="img/ico_arrow_red_right.png">
                        <span class="amont">-100,00€</span>
                        <span class="negative-amount"></span><b>Bancomat - Prelevamento Presso Altro Istituto</b>
                        <br/>
                        <span class="date">22/04/2013</span>
                        <span class="clr"></span>
                    </a>
                </li>
            </ul>
        </div>
        
        <div>
            <ul data-bk-role="link-list"  class="account-list">
                <li>
                    <a href="account_list.php" data-bk-animation="slide-backwards"
                       data-bk-link-icon="img/ico_arrow_red_right.png" data-bk-link-icon-hybrid="img/ico_arrow_red_right.png">
                        <b>Back</b>
                    </a>
                </li>
            </ul>
        </div>
        
        <?php include 'inc_footer.php'; ?>
        
    </body>
</html>